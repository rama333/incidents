package rabbitmq

import (
	"encoding/json"
	"github.com/assembla/cony"
	"github.com/sirupsen/logrus"
	"github.com/streadway/amqp"
	"hpNNM/entity"
)

type Consumer struct {
	conyClient   *cony.Client
	conyConsumer *cony.Consumer
	service Service
}

type Service interface {
	DataProcessing(incidents []entity.Incidents)
}

func NewConsumer(url, exchange string, service Service) *Consumer {

	client := cony.NewClient(cony.URL(url), cony.Backoff(cony.DefaultBackoff))

	conyExchange := cony.Exchange{
		Name: exchange,
		Kind: exchangeKind,
	}

	queue := &cony.Queue{
		Name:       "",
		Durable:    false,
		AutoDelete: true,
		Exclusive:  true,
	}

	client.Declare([]cony.Declaration{
		cony.DeclareExchange(conyExchange),
		cony.DeclareQueue(queue),
		cony.DeclareBinding(cony.Binding{
			Queue:    queue,
			Exchange: conyExchange,
			Key:      exchangeKey,
		}),
	})

	consumer := cony.NewConsumer(queue, cony.AutoTag(), cony.AutoAck(),
		cony.Qos(1))

	client.Consume(consumer)

	fc := &Consumer{
		conyClient:   client,
		conyConsumer: consumer,
		service: service,

	}

	log := logrus.WithFields(logrus.Fields{
		"subsystem":  "consumer",
	})

	//fc.wg.Add(1)
	go func() {
		//defer fc.wg.Done()

		for client.Loop() {
			select {

			case d, ok := <-fc.conyConsumer.Deliveries():
				if !ok {
					continue
				}

				var obj []entity.Incidents

				err := json.Unmarshal(d.Body, &obj)
				if err != nil {
					log.WithError(err).Errorf(
						"failed to JSON unmarshal recognized face")
					continue
				}

				fc.service.DataProcessing(obj)

			case err, ok := <-consumer.Errors():
				if !ok {
					continue
				}
				if err != nil {
					log.WithError(err).Error("got consumer error")
				}

			case err, ok := <-client.Errors():
				if !ok {
					continue
				}
				if err != (*amqp.Error)(nil) {
					log.WithError(err).Error("got client error")
				}
			}
		}
	}()

	return fc
}

func (c *Consumer) Stop()  {
	c.conyClient.Close()
	c.conyConsumer.Cancel()

}
