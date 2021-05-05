package rabbitmq

import (
	"encoding/json"
	"github.com/assembla/cony"
	"github.com/sirupsen/logrus"
	"github.com/streadway/amqp"
	"hpNNM/entity"
	"time"
)

type Storage interface {
	GetIncident(zone string) (rm []entity.Incidents, err error)
}

type Publisher struct {
	client    *cony.Client
	publisher *cony.Publisher
	log       *logrus.Entry
	storage Storage
}

func NewPublisher(uri, exchange string, storage Storage) *Publisher {
	client := cony.NewClient(cony.URL(uri),
		cony.Backoff(cony.DefaultBackoff))

	client.Declare([]cony.Declaration{
		cony.DeclareExchange(cony.Exchange{
			Name: exchange,
			Kind: "topic",
		}),
	})

	publisher := cony.NewPublisher(exchange, exchangeKey)

	client.Publish(publisher)

	log := logrus.WithFields(logrus.Fields{
		"subsystem":  "rmq_recognized_face_publisher",
	})

	go func() {
		for client.Loop() {
			select {
			case err, ok := <-client.Errors():
				if !ok {
					continue
				}
				if err == (*amqp.Error)(nil) {
					continue
				}
				log.WithError(err).Error("got cony client error")
			case blocked, ok := <-client.Blocking():
				if !ok {
					continue
				}
				log.WithField("reason", blocked.Reason).
					Warn("cony client is blocking")
			}
		}
	}()

	return &Publisher{
		client:    client,
		publisher: publisher,
		log:       log,
		storage: storage,

	}
}

func (p *Publisher) Stop() {
	p.publisher.Cancel()
	p.client.Close()
}

func (p *Publisher) Publish(rf []entity.Incidents) {
	fJSON, err := json.Marshal(rf)
	if err != nil {
		p.log.WithError(err).Error("failed to JSON marshal recognized face")
		return
	}

	err = p.publisher.Publish(amqp.Publishing{
		Body: fJSON,
	})
	if err != nil {
		p.log.WithError(err).Error("failed to publish recognized face")
		return
	}
}

func (p *Publisher) PublishIncidents(zones []string)  {
	const (
		tickPeriod = 5
	)

	ticker := time.NewTicker(time.Second * tickPeriod)

	defer ticker.Stop()

	for  {

		<-ticker.C

		p.log.Info("receiving incidents")

		for _, zone := range zones{
			incidents, err := p.storage.GetIncident(zone)

			if err != nil {
				p.log.Error(err)
			}

			p.log.Info(zone, " " , len(incidents))

			if len(incidents) == 0 {
				continue
			}

			for _, incident := range incidents {
				incident.SetZone(zone)
			}

			p.Publish(incidents)
		}

	}

}
