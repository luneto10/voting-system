package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/luneto10/voting-system/api/model"
	"github.com/luneto10/voting-system/api/request"
	"github.com/luneto10/voting-system/internal/schema"
	"github.com/luneto10/voting-system/internal/service"
)

type FormHandler struct {
	formService *service.FormService
}

func NewFormHandler(formService *service.FormService) *FormHandler {
	return &FormHandler{formService: formService}
}

func (h *FormHandler) CreateForm(c *gin.Context) {
	req := request.CreateFormRequest{}

	if err := c.ShouldBindJSON(&req); err != nil {
		schema.SendError(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := req.Validate(); err != nil {
		schema.SendValidationError(c, err)
		return
	}

	form := &model.Form{
		Title: req.Title,
	}

	created, err := h.formService.CreateForm(form)
	if err != nil {
		switch err {
		case service.ErrInvalidTitle:
			schema.SendError(c, http.StatusUnprocessableEntity, err.Error())
		default:
			schema.SendError(c, http.StatusInternalServerError, err.Error())
		}
		return
	}

	schema.SendSuccess(c, "create-form", created)
}
