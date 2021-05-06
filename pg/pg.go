package pg

import (
	"context"
	"errors"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/sirupsen/logrus"
	"hpNNM/entity"
	"time"
)

type Storage struct {
	db  *sqlx.DB
	uri string

	log *logrus.Entry
}

func NewStorage(uri string) ( *Storage, error) {
	db, err := sqlx.Open("postgres", uri)
	if err != nil {
		return nil, errors.New("open DB: " + err.Error())
	}

	ctx, cancel := context.WithTimeout(context.TODO(), 10*time.Second)

	err = db.PingContext(ctx)
	cancel()
	if err != nil {
		return nil, errors.New("ping DB: " + err.Error())
	}

	return &Storage{
		db:  db,
		uri: uri,
		log: logrus.WithField("subsystem", "postgres_storage"),
	}, nil
}


func (s * Storage) CreateIncident(inc entity.Incidents, longitude, latitude string) (err error)  {

	_, err = s.db.Exec(`insert into incidents (incident_id, reg_modified, long_name, node_name, lifecyclestate, longitude, latitude, zone) values ($1, $2, $3, $4, $5, $6, $7, $8)`, inc.ID, inc.REG_MODIFIED, inc.LONG_NAME, inc.NODE_NAME, inc.LIFECYCLESTATE, longitude, latitude, inc.Zone)

	return
}

func (s * Storage) GetIncidentsByZone(zone string) (inc []entity.PgIncidents, err error)  {
	err = s.db.Select(&inc, "select * from incidents where zone=$1", zone)

	return
}

func (s * Storage) GetIncidents( ) (inc []entity.PgIncidents, err error)  {
	err = s.db.Select(&inc, "select * from incidents")

	return
}

func (s * Storage) RemoveIncident(ip string) (err error) {
	_, err = s.db.Exec("delete from incidents where long_name = $1", ip)

	return
}



