package schema

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/luneto10/voting-system/internal/validation"
)

func SendError(ctx *gin.Context, code int, msg string) {
	ctx.Header("Content-type", "application/json")
	ctx.JSON(code, gin.H{
		"message":   msg,
		"errorCode": code,
	})
}

func SendSuccess(ctx *gin.Context, op string, data any) {
	ctx.Header("Content-type", "application/json")

	ctx.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("operation from handler: %s successfull", op),
		"data":    data,
	})
}

func SendValidationError(ctx *gin.Context, err error) {
	errors := validation.FormatErrors(err)
	ctx.Header("Content-type", "application/json")
	ctx.JSON(http.StatusUnprocessableEntity, gin.H{
		"errors": errors,
	})
}
