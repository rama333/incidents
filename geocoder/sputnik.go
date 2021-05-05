package geocoder

import (
	"encoding/json"
	"github.com/sirupsen/logrus"
	"net/http"
	"net/url"
)

type ApiSputnik struct {
	Meta struct {
		Found   int    `json:"found"`
		Shown   int    `json:"shown"`
		Version string `json:"version"`
		Format  string `json:"format"`
	} `json:"meta"`
	Result []struct {
		Id          int     `json:"id"`
		Type        string  `json:"type"`
		Description string  `json:"description"`
		DisplayName string  `json:"display_name"`
		Title       string  `json:"title"`
		FiasId      string  `json:"fias_id"`
		SortScore   float64 `json:"SortScore"`
		FullMatch   bool    `json:"full_match"`
		Position    struct {
			Lat float64 `json:"lat"`
			Lon float64 `json:"lon"`
		} `json:"position"`
	} `json:"result"`
	Typo struct {
		OriginalQuery string `json:"OriginalQuery"`
		FixedQuery    string `json:"FixedQuery"`
		Rank          int    `json:"Rank"`
	} `json:"typo"`
}

func Get(addr string) (*ApiSputnik) {
	res, err := http.Get("http://search.maps.sputnik.ru/search?q=" + url.QueryEscape(addr))

	if err != nil {
		logrus.Error(err)
	}

	defer res.Body.Close()

	logrus.Info(res.Request.URL)
	logrus.Info(res.Status)
	logrus.Info(res.StatusCode)

	var apiSputnik ApiSputnik


	json.NewDecoder(res.Body).Decode(&apiSputnik)


	return &apiSputnik
}
