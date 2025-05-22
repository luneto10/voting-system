package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/copier"
	"github.com/luneto10/voting-system/api/dto"
	"github.com/luneto10/voting-system/api/model"
	"github.com/luneto10/voting-system/internal/schema"
	"github.com/luneto10/voting-system/internal/service"
)

type FormHandler struct {
	formService service.FormService
}

func NewFormHandler(formService service.FormService) *FormHandler {
	return &FormHandler{formService: formService}
}

func (h *FormHandler) CreateForm(c *gin.Context) {
	req := new(dto.CreateFormRequest)
	if ok := bindAndValidate(c, &req); !ok {
		return
	}

	form := new(model.Form)
	if err := copier.Copy(form, &req); err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	created, err := h.formService.CreateForm(form)
	if err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	resp := new(dto.GetFormResponse)
	if err := copier.Copy(&resp, created); err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	schema.SendSuccess(c, "create-form", resp)
}

func (h *FormHandler) GetForm(c *gin.Context) {
	id := c.Param("id")

	form, err := h.formService.GetForm(id)
	if err != nil {
		schema.SendError(c, http.StatusNotFound, err.Error())
		return
	}

	resp := new(dto.GetFormResponse)
	if err := copier.Copy(&resp, form); err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	schema.SendSuccess(c, "get-form", resp)
}

func (h *FormHandler) UpdateForm(c *gin.Context) {
	id := c.Param("id")

	req := new(dto.UpdateFormRequest)
	if ok := bindAndValidate(c, &req); !ok {
		return
	}

	updated, err := h.formService.UpdateForm(id, req)
	if err != nil {
		switch err {
		case service.ErrFormNotFound:
			schema.SendError(c, http.StatusNotFound, err.Error())
		default:
			schema.SendError(c, http.StatusInternalServerError, err.Error())
		}
		return
	}

	resp := new(dto.GetFormResponse)
	if err := copier.Copy(&resp, updated); err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	schema.SendSuccess(c, "update-form", resp)
}
