package oracle

import (
	"context"
	"errors"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
	_ "gopkg.in/goracle.v2"
	"hpNNM/entity"
	"time"
)

type Storage struct {
	db *sqlx.DB
	url string
	log *logrus.Entry
}

func NewStorage(url string) (*Storage, error)  {

	db, err := sqlx.Open("goracle", "Tat100frf/n9zDIYHohyoeh6kgcvXS@(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=tcp)(HOST=192.168.100.218)(PORT=1521)))(CONNECT_DATA=(SERVICE_NAME=HPMonitor)))")

	if err != nil{
		return &Storage{}, errors.New("failed open db")
	}

	ctx, cancel := context.WithTimeout(context.TODO(), 3*time.Second)

	err = db.PingContext(ctx)
	cancel()
	if err != nil {
		return nil, errors.New("ping DB: " + err.Error())
	}

	return &Storage{
		db: db,
		url: url,
		log: logrus.WithField("subsystem", "oracle db"),
	}, nil
}

func (s * Storage) GetIncident(zone string) (rm []entity.Incidents, err error)  {

	err = s.db.Select(&rm ,`SELECT 
    a.ID, 
    a.REG_MODIFIED,
    (SELECT b.LONG_NAME 
        FROM `+zone+`.NMS_NODE b
        where b.UUID=a.NODE_UUID
            and REGEXP_LIKE(b.LONG_NAME, '^(([0-9]{1}|[0-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]{1}|[0-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$')
            /* Karimov I. проверка соотвествия IP адресу */) as    LONG_NAME,
    a.NODE_NAME,
    a.LIFECYCLESTATE
    FROM `+zone+`.NMS_INCIDENTS a
    WHERE     
    (a.NAME='NodeDown' or a.NAME='NodeOrConnectionDown') 
    AND (a.LIFECYCLESTATE = 92)
   -- AND ((SYSTIMESTAMP-1)<a.REG_CREATED) -- берем только события, которые не старше 24 часов
    AND (a.REG_CREATED < (SYSTIMESTAMP-5/(24*60)))  -- берем только те события, которые старше 5 минут
    and (a.NODE_NAME not Like 'CAM%')
    --and (a.NODE_NAME not Like '10.150.%')
    --and (a.NODE_NAME not Like '10.156.%')
    /* S.S.Matveev временно исключено, т.к. неправильно заведен в NNM */
    and (a.NODE_NAME not like 'KAM%')
    --and (a.NODE_NAME not Like '10.157.%')
    and (a.NODE_NAME not Like '172.27.%')
    and (UPPER(a.NODE_NAME) <> 'FOM16')
    ORDER BY ID ASC`)

return rm,err
}


