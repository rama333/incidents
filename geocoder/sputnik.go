package geocoder

import (
	"encoding/json"
	"github.com/sirupsen/logrus"
	"net/http"
	"net/url"
)

type ApiSputnik struct {
	Response struct {
		GeoObjectCollection struct {
			MetaDataProperty struct {
				GeocoderResponseMetaData struct {
					Request string `json:"request"`
					Results string `json:"results"`
					Found   string `json:"found"`
				} `json:"GeocoderResponseMetaData"`
			} `json:"metaDataProperty"`
			FeatureMember []struct {
				GeoObject struct {
					MetaDataProperty struct {
						GeocoderMetaData struct {
							Precision string `json:"precision"`
							Text      string `json:"text"`
							Kind      string `json:"kind"`
							Address   struct {
								CountryCode string `json:"country_code"`
								Formatted   string `json:"formatted"`
								PostalCode  string `json:"postal_code"`
								Components  []struct {
									Kind string `json:"kind"`
									Name string `json:"name"`
								} `json:"Components"`
							} `json:"Address"`
							AddressDetails struct {
								Country struct {
									AddressLine        string `json:"AddressLine"`
									CountryNameCode    string `json:"CountryNameCode"`
									CountryName        string `json:"CountryName"`
									AdministrativeArea struct {
										AdministrativeAreaName string `json:"AdministrativeAreaName"`
										Locality               struct {
											LocalityName string `json:"LocalityName"`
											Thoroughfare struct {
												ThoroughfareName string `json:"ThoroughfareName"`
												Premise          struct {
													PremiseNumber string `json:"PremiseNumber"`
													PostalCode    struct {
														PostalCodeNumber string `json:"PostalCodeNumber"`
													} `json:"PostalCode"`
												} `json:"Premise"`
											} `json:"Thoroughfare"`
										} `json:"Locality"`
									} `json:"AdministrativeArea"`
								} `json:"Country"`
							} `json:"AddressDetails"`
						} `json:"GeocoderMetaData"`
					} `json:"metaDataProperty"`
					Name        string `json:"name"`
					Description string `json:"description"`
					BoundedBy   struct {
						Envelope struct {
							LowerCorner string `json:"lowerCorner"`
							UpperCorner string `json:"upperCorner"`
						} `json:"Envelope"`
					} `json:"boundedBy"`
					Point struct {
						Pos string `json:"pos"`
					} `json:"Point"`
				} `json:"GeoObject"`
			} `json:"featureMember"`
		} `json:"GeoObjectCollection"`
	} `json:"response"`
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

func Get(addr string) (*ApiSputnik) {
	res, err := http.Get("https://geocode-maps.yandex.ru/1.x/?apikey=033ce4ee-c661-447c-aef9-d2d151eb9bbf&format=json&geocode=" + url.QueryEscape(addr))

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
