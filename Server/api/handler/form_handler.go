package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/copier"
	"github.com/luneto10/voting-system/api/dto"
	"github.com/luneto10/voting-system/api/model"
	"github.com/luneto10/voting-system/internal/schema"
	"github.com/luneto10/voting-system/internal/service"
)

type FormHandler struct {
	authService service.AuthService
	formService service.FormService
}

func NewFormHandler(formService service.FormService, authService service.AuthService) *FormHandler {
	return &FormHandler{formService: formService, authService: authService}
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

	// Set the user ID from the authenticated user
	form.UserID = c.GetUint("user_id")

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
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		schema.SendError(c, http.StatusBadRequest, "invalid form ID")
		return
	}

	userID := c.GetUint("user_id")

	// Check if user is the owner of the form
	isOwner, err := h.formService.IsFormOwner(userID, uint(id))
	if err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}
	if !isOwner {
		schema.SendError(c, http.StatusForbidden, "you can only access forms that you own")
		return
	}

	form, err := h.formService.GetForm(uint(id))
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

func (h *FormHandler) GetPublicForm(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		schema.SendError(c, http.StatusBadRequest, "invalid form ID")
		return
	}

	form, err := h.formService.GetForm(uint(id))
	if err != nil {
		schema.SendError(c, http.StatusNotFound, err.Error())
		return
	}

	resp := new(dto.GetPublicFormResponse)
	if err := copier.Copy(&resp, form); err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	schema.SendSuccess(c, "get-public-form", resp)
}

func (h *FormHandler) UpdateForm(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		schema.SendError(c, http.StatusBadRequest, "invalid form ID")
		return
	}

	req := new(dto.UpdateFormRequest)
	if ok := bindAndValidate(c, &req); !ok {
		return
	}

	userID := c.GetUint("user_id")
	updated, err := h.formService.UpdateForm(uint(id), userID, req)
	if err != nil {
		switch err {
		case service.ErrFormNotFound:
			schema.SendError(c, http.StatusNotFound, err.Error())
		case service.ErrNotFormOwner:
			schema.SendError(c, http.StatusForbidden, err.Error())
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

func (h *FormHandler) DeleteForm(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		schema.SendError(c, http.StatusBadRequest, "invalid form ID")
		return
	}

	userID := c.GetUint("user_id")
	if err := h.formService.DeleteForm(uint(id), userID); err != nil {
		switch err {
		case service.ErrFormNotFound:
			schema.SendError(c, http.StatusNotFound, err.Error())
		case service.ErrNotFormOwner:
			schema.SendError(c, http.StatusForbidden, err.Error())
		default:
			schema.SendError(c, http.StatusInternalServerError, err.Error())
		}
		return
	}

	schema.SendSuccess(c, "delete-form", nil)
}

func (h *FormHandler) GetUserForms(c *gin.Context) {
	userID := c.GetUint("user_id")
	forms, err := h.formService.GetFormsByUserID(userID)
	if err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	resp := make([]dto.GetFormResponse, len(forms))
	for i, form := range forms {
		if err := copier.Copy(&resp[i], form); err != nil {
			schema.SendError(c, http.StatusInternalServerError, err.Error())
			return
		}
	}

	schema.SendSuccess(c, "get-user-forms", resp)
}

func (h *FormHandler) SubmitForm(c *gin.Context) {
	formIDStr := c.Param("id")
	formID, err := strconv.ParseUint(formIDStr, 10, 64)
	if err != nil {
		schema.SendError(c, http.StatusBadRequest, "invalid form ID")
		return
	}
	userID := c.GetUint("user_id")

	req := new(dto.SubmitFormRequest)
	if ok := bindAndValidate(c, &req); !ok {
		return
	}

	submission, err := h.formService.SubmitForm(uint(formID), userID, req.Answers)
	if err != nil {
		switch err {
		case service.ErrFormNotFound:
			schema.SendError(c, http.StatusNotFound, err.Error())
		case service.ErrSubmissionAlreadyExists:
			schema.SendError(c, http.StatusBadRequest, err.Error())
		case service.ErrCannotSubmitOwnForm:
			schema.SendError(c, http.StatusForbidden, err.Error())
		default:
			schema.SendError(c, http.StatusInternalServerError, err.Error())
		}
		return
	}

	resp := new(dto.SubmitFormResponse)
	if err := copier.Copy(resp, submission); err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	schema.SendSuccess(c, "submit-form", resp)
}

func (h *FormHandler) UserSubmittedForm(c *gin.Context) {
	formIDStr := c.Param("id")
	formID, err := strconv.ParseUint(formIDStr, 10, 64)
	if err != nil {
		schema.SendError(c, http.StatusBadRequest, "invalid form ID")
		return
	}

	email := c.Query("email")
	if email == "" {
		schema.SendError(c, http.StatusBadRequest, "email query parameter is required")
		return
	}

	user, err := h.authService.GetUserByEmail(email)
	if err != nil && err != service.ErrUserNotFound {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	if user == nil {
		schema.SendSuccess(c, "user-submitted-form", gin.H{"submitted": false})
		return
	}

	submitted, err := h.formService.UserSubmittedForm(uint(formID), user.ID)
	if err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	schema.SendSuccess(c, "user-submitted-form", gin.H{"submitted": submitted})
}

func (h *FormHandler) GetFormVoters(c *gin.Context) {
	formIDStr := c.Param("id")
	formID, err := strconv.ParseUint(formIDStr, 10, 64)
	if err != nil {
		schema.SendError(c, http.StatusBadRequest, "invalid form ID")
		return
	}

	userID := c.GetUint("user_id")
	submissions, err := h.formService.GetFormVoters(uint(formID), userID)
	if err != nil {
		switch err {
		case service.ErrFormNotFound:
			schema.SendError(c, http.StatusNotFound, err.Error())
		case service.ErrNotFormOwner:
			schema.SendError(c, http.StatusForbidden, err.Error())
		default:
			schema.SendError(c, http.StatusInternalServerError, err.Error())
		}
		return
	}

	resp := make([]dto.FormVoterResponse, len(submissions))
	for i, submission := range submissions {
		resp[i] = dto.FormVoterResponse{
			ID:          submission.ID,
			UserID:      submission.UserID,
			Email:       submission.User.Email,
			CompletedAt: submission.CompletedAt,
		}
	}

	schema.SendSuccess(c, "get-form-voters", resp)
}
