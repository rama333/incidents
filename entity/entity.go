package entity

import "database/sql"

type Incidents struct {
	ID         int64      `db:"ID" json:"id,omitempty"`
	REG_MODIFIED    string  `db:"REG_MODIFIED" json:"reg_modified,omitempty"`
	LONG_NAME       string  `db:"LONG_NAME" json:"long_name,omitempty"`
	NODE_NAME      string   `db:"NODE_NAME" json:"node_name,omitempty"`
	LIFECYCLESTATE   int `db:"LIFECYCLESTATE" json:"lifecyclestate,omitempty"`
	//OPERDATE      time.Time    `db:"OPERDATE" json:"operdate,omitempty"`
	FORMATTED_MESSAGE sql.NullString `db:"FORMATTED_MESSAG" json:"formatted_message,omitempty"`
	Zone string `json:"zone"`
}

func (i * Incidents) SetZone(zone string)  {
	i.Zone = zone
}

type PgIncidents struct {
	IDs         int64      `db:"id" json:"id,omitempty"`
	ID         int64      `db:"incident_id" json:"incident_id,omitempty"`
	REG_MODIFIED    string  `db:"reg_modified" json:"reg_modified,omitempty"`
	LONG_NAME       string  `db:"long_name" json:"long_name,omitempty"`
	NODE_NAME      string   `db:"node_name" json:"node_name,omitempty"`
	LIFECYCLESTATE   int `db:"lifecyclestate" json:"lifecyclestate,omitempty"`
	//OPERDATE      time.Time    `db:"OPERDATE" json:"operdate,omitempty"`
	Zone string `db:"zone" json:"zone"`
	Longitude float64 `db:"longitude" json:"longitude"`
	Latitude float64 `db:"latitude" json:"latitude"`
	Services string `json:"services"`
	Addres string `json:"addres"`
}
