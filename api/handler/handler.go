package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/luneto10/voting-system/internal/schema"
)

func bindAndValidate(c *gin.Context, req any) bool {
	if err := c.ShouldBindJSON(req); err != nil {
		if ve, ok := err.(validator.ValidationErrors); ok {
			schema.SendValidationError(c, ve)
		} else {
			schema.SendError(c, http.StatusBadRequest, err.Error())
		}
		return false
	}
	return true
}
