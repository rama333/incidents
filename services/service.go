package services

import (
	"bytes"
	"encoding/json"
	"github.com/sirupsen/logrus"
	"hpNNM/entity"
	"hpNNM/geocoder"
	"net/http"
)

type AddrByIP struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    []struct {
		Ip   string `json:"ip"`
		Spd  string `json:"spd"`
		Iptv string `json:"iptv"`
		Sip  string `json:"sip"`
		Addr string `json:"addr"`
	} `json:"data"`
}

type Storage interface {
	CreateIncident(inc entity.Incidents, longitude, latitude float64) (err error)
	GetIncidents() (inc []entity.Incidents, err error)
	RemoveIncident(id string) (err error)
}

type IncidentsService struct {
	storage Storage
	log *logrus.Entry
}

func NewIncidentsService(storage Storage) (*IncidentsService) {

	return &IncidentsService{
		storage: storage,
		log: logrus.WithFields(logrus.Fields{"subsystem":"service"}),
	}
}

func (s *IncidentsService) DataProcessing(incidents []entity.Incidents)  {


	for _, incident := range incidents {

		ser := getAddrByIP(incident.LONG_NAME)
		geo := geocoder.Get(ser.Data[0].Ip)
		s.storage.CreateIncident(incident, geo.Result[0].Position.Lon, geo.Result[0].Position.Lat)
	}


}


func getAddrByIP(ip string) (* AddrByIP)  {

	request := struct {
		Ip []string `json:"ip"`
	}{}

	data := []string{ip}

	request.Ip = data

	byt, err := json.Marshal(request)
	if err != nil {
		logrus.Info(err)
	}

	res, err := http.Post("http://192.168.114.145:4000/Services", "application/json", bytes.NewReader(byt))

	if err != nil {
		logrus.Info(err)
		return &AddrByIP{}
	}

	var addr AddrByIP

	json.NewDecoder(res.Body).Decode(&addr)

	logrus.Info(addr)

	return &addr
}