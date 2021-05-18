package geocoder

import (
	"encoding/json"
	"github.com/sirupsen/logrus"
	"net/http"
	"net/url"
)


type ApiYandex struct {
	Type       string `json:"type"`
	Properties struct {
		ResponseMetaData struct {
			SearchResponse struct {
				Found     int         `json:"found"`
				Display   string      `json:"display"`
				BoundedBy [][]float64 `json:"boundedBy"`
			} `json:"SearchResponse"`
			SearchRequest struct {
				Request   string      `json:"request"`
				Skip      int         `json:"skip"`
				Results   int         `json:"results"`
				BoundedBy [][]float64 `json:"boundedBy"`
			} `json:"SearchRequest"`
		} `json:"ResponseMetaData"`
	} `json:"properties"`
	Features []struct {
		Type     string `json:"type"`
		Geometry struct {
			Type        string    `json:"type"`
			Coordinates []float64 `json:"coordinates"`
		} `json:"geometry"`
		Properties struct {
			Name             string      `json:"name"`
			Description      string      `json:"description"`
			BoundedBy        [][]float64 `json:"boundedBy"`
			GeocoderMetaData struct {
				Precision string `json:"precision"`
				Text      string `json:"text"`
				Kind      string `json:"kind"`
			} `json:"GeocoderMetaData"`
		} `json:"properties"`
	} `json:"features"`
}

//type ApiSputnik struct {
//	Meta struct {
//		Found   int    `json:"found"`
//		Shown   int    `json:"shown"`
//		Version string `json:"version"`
//		Format  string `json:"format"`
//	} `json:"meta"`
//	Result []struct {
//		Id          int     `json:"id"`
//		Type        string  `json:"type"`
//		Description string  `json:"description"`
//		DisplayName string  `json:"display_name"`
//		Title       string  `json:"title"`
//		FiasId      string  `json:"fias_id"`
//		SortScore   float64 `json:"SortScore"`
//		FullMatch   bool    `json:"full_match"`
//		Position    struct {
//			Lat float64 `json:"lat"`
//			Lon float64 `json:"lon"`
//		} `json:"position"`
//	} `json:"result"`
//	Typo struct {
//		OriginalQuery string `json:"OriginalQuery"`
//		FixedQuery    string `json:"FixedQuery"`
//		Rank          int    `json:"Rank"`
//	} `json:"typo"`
//}

func Get(addr string) (*ApiYandex) {
	res, err := http.Get("https://search-maps.yandex.ru/v1/?text="+ url.QueryEscape(addr) +"&lang=ru_RU&type=geo&results=1&apikey=3c91791f-30bf-4cfe-a23b-d8ab668daf8e")

	if err != nil {
		logrus.Error(err)
	}

	defer res.Body.Close()

	logrus.Info(res.Request.URL)
	logrus.Info(res.Status)
	logrus.Info(res.StatusCode)

	var apiYandex ApiYandex


	json.NewDecoder(res.Body).Decode(&apiYandex)


	return &apiYandex
}
