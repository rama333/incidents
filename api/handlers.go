package api

import (
	"github.com/gin-gonic/gin"
	"hackTTK/entity"
	"net/http"
)

func (s * Server) PostObject(c *gin.Context)  {
	var obj entity.Obj
	err := c.ShouldBindJSON(&obj)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error":"Status Bad Request"})
	}

	err = s.dbStorage.SetData(obj)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error":"Status Internal Server Error"})
	}

	c.JSON(http.StatusOK, gin.H{"error":"", "status":"ok"})
}

func (s * Server) PostEquipment(c * gin.Context)  {

	var equipment entity.EQUIPMENT

	err := c.ShouldBindJSON(&equipment)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error":"Status Bad Request"})
	}

	err = s.dbStorage.SetEQUIPMENT(equipment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error":"Status Internal Server Error"})
	}

	c.JSON(http.StatusOK, gin.H{"error":"", "status":"ok"})

}
