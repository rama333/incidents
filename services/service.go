package services

import (
	"bytes"
	"encoding/json"
	"github.com/sirupsen/logrus"
	"hpNNM/entity"
	"hpNNM/geocoder"
	"net/http"
	"strconv"
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
	CreateIncident(inc entity.Incidents, longitude, latitude, services, addres string) (err error)
	GetIncidentsByZone(zone string) (inc []entity.PgIncidents, err error)
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


	currentDataIncidents, err := s.storage.GetIncidentsByZone(incidents[0].Zone)

	if err != nil {
		s.log.Error(err)
	}

	set := intersection(incidents, currentDataIncidents)


	logrus.Info( "set", set)

	//на удаление
	var diffCurrendata []entity.PgIncidents
	// на добавление
	var diffIncidents []entity.Incidents

	for _, incident := range currentDataIncidents {

		st := false
		for _, s := range set {
			if s == incident.LONG_NAME {
				st = true
				//logrus.Info("set ok")
			}
		}

		if st {
			continue
		}

		diffCurrendata =  append(diffCurrendata, incident)
	}

	for _, incident := range incidents {
		st := false
		for _, s := range set {
			if s == incident.LONG_NAME {
				//logrus.Info("set ok")
				st = true
			}
		}

		if st {
			continue
		}


		diffIncidents =  append(diffIncidents, incident)
	}


	for _, incident := range diffCurrendata {
		err := s.storage.RemoveIncident(incident.LONG_NAME)

		if err != nil {
			logrus.Error(err)
		}


	}


	for _, incident := range diffIncidents {

		logrus.Info(incident.LONG_NAME)
		logrus.Info(incident.Zone)
		ser := getAddrByIP(incident.LONG_NAME)

		if ser.Code != 200 {
			continue
		}

		geo := geocoder.Get(ser.Data[0].Addr)

		logrus.Info(ser.Data[0].Addr)

		if geo.Properties.ResponseMetaData.SearchResponse.Found == 0 {
			continue
		}


		//g := strings.Split(geo.Response.GeoObjectCollection.FeatureMember[0].GeoObject.Point.Pos, " ")

		services := ser.Data[0].Spd + "/" +  ser.Data[0].Iptv + "/" + ser.Data[0].Sip

		err := s.storage.CreateIncident(incident, strconv.FormatFloat(geo.Features[0].Geometry.Coordinates[0], 'f', -1, 64), strconv.FormatFloat(geo.Features[0].Geometry.Coordinates[1], 'f', -1, 64), services, ser.Data[0].Addr)

		if err != nil {
			logrus.Error(err)
		}
	}
}

func intersection(a []entity.Incidents, b []entity.PgIncidents) ([]string) {

	counter := make(map[string]int)

	var result []string

	if len(a) == 0 || len (b) == 0 {
		logrus.Info("null")
		return result
	}


	for _, incident := range a {
		if  _, ok := counter[incident.LONG_NAME]; !ok {
			counter[incident.LONG_NAME] = 1
		} else {
			counter[incident.LONG_NAME] += 1
		}
	}

	for _, incident := range b {
		if  count, ok := counter[incident.LONG_NAME]; ok && count > 0{
			result = append(result, incident.LONG_NAME)
			counter[incident.LONG_NAME] -= 1
		}
	}

	return result
}

func getAddrByIP(ip string) (* AddrByIP)  {

	request := struct {
		Ip []string `json:"ip"`
	}{}

	data := []string{ip}

	request.Ip = data

	byt, err := json.Marshal(request)
	if err != nil {
		//logrus.Info(err)
	}

	res, err := http.Post("http://192.168.114.145:4000/Services", "application/json", bytes.NewReader(byt))

	if err != nil {
		logrus.Info(err)
		return &AddrByIP{}
	}

	var addr AddrByIP

	json.NewDecoder(res.Body).Decode(&addr)

	//logrus.Info(addr)

	return &addr
}