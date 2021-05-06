package api

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (s * Server) GetIncidents(c *gin.Context)  {


	incidents, err := s.dbStorage.GetIncidents()

	if err != nil {
		c.JSON(http.StatusInternalServerError, "")
	}

	c.JSON(http.StatusOK, incidents)
}

