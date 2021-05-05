package taker

import (
	"errors"
	"fmt"
	"io/ioutil"

	"gopkg.in/yaml.v2"
)

type Config struct {
	RabbitMQURI         string  `yaml:"rabbitmq_uri"`
	RabbitMQExchange    string  `yaml:"rabbitmq_exchange"`
	PostgresURI string `yaml:"postgres_uri"`
	OracleURI string `yaml:"oracle_uri"`
}

func (c Config) Validate() error {
	if c.RabbitMQURI == "" {
		return errors.New("rabbitmq_uri is empty")
	}
	if c.RabbitMQExchange == "" {
		return errors.New("rabbitmq_exchange is empty")
	}
	if c.PostgresURI == "" {
		return errors.New("postgres_uri is empty")
	}

	if c.OracleURI == "" {
		return errors.New("oracle_uri is empty")
	}

	return nil
}

func LoadConfig(configPath string) (Config, error) {
	configYAML, err := ioutil.ReadFile(configPath)
	if err != nil {
		return Config{}, fmt.Errorf("read config %s file: %w", configPath, err)
	}

	var c Config

	err = yaml.Unmarshal(configYAML, &c)
	if err != nil {
		return Config{}, fmt.Errorf("YAML unmarshal config: %w", err)
	}

	return c, nil
}
