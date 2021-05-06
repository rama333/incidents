package main

import (
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"hpNNM/api"
	"hpNNM/configs/taker"
	"hpNNM/pg"
	"hpNNM/rabbitmq"
	"hpNNM/services"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main()  {

	if err:= run(); err != nil {
		logrus.Fatal(err)
	}

}

func run() (error)  {

	var st time.Time
	defer func() {
		logrus.WithField("shutdown_time", time.Now().Sub(st)).Info("stopped")
	}()

	conf, err := taker.LoadConfig("/Users/ramilramilev/go/src/hpNNM/configs/taker/hp.conf")

	if err != nil {
		return errors.Wrap(err, "failed load config")
	}




	pg, err := pg.NewStorage(conf.PostgresURI)

	if err != nil {
		return errors.Wrap(err, "failed connect to db pg:")
	}


	server, err := api.NewServer(":8080", pg)

	if err != nil {
		return  errors.Wrap(err, "failed create server:")
	}

	defer server.Stop()

	service := services.NewIncidentsService(pg)

	rmq := rabbitmq.NewConsumer(conf.RabbitMQURI, conf.RabbitMQExchange, service)

	defer rmq.Stop()

	logrus.Info("services starting")
	signals := make(chan os.Signal)
	signal.Notify(signals, os.Interrupt, syscall.SIGTERM)

	logrus.Infof("captured %v signal, stopping", <-signals)

	st = time.Now()

	return nil
}
