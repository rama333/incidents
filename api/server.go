package api

import (
	"context"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"hpNNM/entity"
	"net/http"
	"sync"
	"time"
)

type DBStorage interface {
	GetIncidents( ) (inc []entity.PgIncidents, err error)
}


type Server struct {
	dbStorage DBStorage

	httpServer *http.Server
	gin *gin.Engine

	log *logrus.Entry

	wg sync.WaitGroup
	stop chan struct{}

}

//func CORSMiddleware() gin.HandlerFunc {
//	return func(c *gin.Context) {
//		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
//		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
//		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
//		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")
//
//		if c.Request.Method == "OPTIONS" {
//			c.AbortWithStatus(204)
//			return
//		}
//
//		c.Next()
//	}
//}



func NewServer(bindAddr string, storage DBStorage) (*Server, error) {

	server := &Server{
		dbStorage: storage,
		log: logrus.WithField("subsytem", "web_server"),
	}

	server.stop = make(chan struct{})

	router := gin.New()

	router.Use(gin.Recovery())
	router.Use(gin.Logger())
	//router.Use(CORSMiddleware())

	router.LoadHTMLGlob("../../templates/*")
	router.Static("/assets", "../../assets")

	router.GET("/", func(c *gin.Context) {

		c.HTML(
			http.StatusOK,
			"index.html",
			gin.H{
				"title": "Home Page",
			})
	})


	r := router.Group("api/v1")
	{
		r.GET("/incidents", server.GetIncidents)
	}


	server.httpServer = &http.Server{
		Addr: bindAddr,
		Handler: router,
	}

	server.wg.Add(1)

	go func() {
		defer server.wg.Done()
		for {
			select {
			case <-server.stop:
				return
			default:
			}

			server.log.Info("starting")

			if err := server.httpServer.ListenAndServe(); err != nil{
				if err == http.ErrServerClosed {
					return
				}
				server.log.WithError(err).Error("failed to start")
			}

			time.Sleep(3 * time.Second)
		}
	}()


	return server, nil
}

func (s *Server) Stop()  {
	ctx, cancel := context.WithTimeout(context.Background(), 10 * time.Second)

	defer cancel()

	close(s.stop)

	err := s.httpServer.Shutdown(ctx)

	if err != nil {
		s.log.WithError(err).Error("failed to gracefull shutdown")
	}

	s.wg.Wait()
}
