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
