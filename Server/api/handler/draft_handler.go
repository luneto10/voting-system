package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/luneto10/voting-system/api/dto"
	"github.com/luneto10/voting-system/internal/schema"
	"github.com/luneto10/voting-system/internal/service"
)

type DraftHandler struct {
	draftService     service.DraftService
	dashboardService service.DashboardService
}

func NewDraftHandler(
	draftService service.DraftService,
	dashboardService service.DashboardService,
) *DraftHandler {
	return &DraftHandler{
		draftService:     draftService,
		dashboardService: dashboardService,
	}
}

func (h *DraftHandler) SaveDraft(c *gin.Context) {
	userID := c.GetUint("user_id")

	req := new(dto.SaveDraftRequest)
	if ok := bindAndValidate(c, &req); !ok {
		return
	}

	// Update form status to in_progress when saving draft
	if err := h.dashboardService.UpdateUserFormStatus(userID, req.FormID, "in_progress"); err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	draft, err := h.draftService.SaveDraft(userID, req.FormID, req)
	if err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	var answers []dto.AnswerSubmission
	if err := json.Unmarshal(draft.Answers, &answers); err != nil {
		schema.SendError(c, http.StatusInternalServerError, "failed to unmarshal answers")
		return
	}

	response := dto.DraftSubmissionResponse{
		ID:                 draft.ID,
		FormID:             draft.FormID,
		UserID:             draft.UserID,
		FormTitle:          draft.Form.Title,
		FormDescription:    draft.Form.Description,
		LastModified:       draft.UpdatedAt,
		ProgressPercentage: draft.ProgressPercentage,
		Answers:            answers,
	}

	schema.SendSuccess(c, "save-draft", response)
}

func (h *DraftHandler) GetDraft(c *gin.Context) {
	userID := c.GetUint("user_id")

	formIDStr := c.Param("formId")
	formID, err := strconv.ParseUint(formIDStr, 10, 64)
	if err != nil {
		schema.SendError(c, http.StatusBadRequest, "invalid form ID")
		return
	}

	draft, err := h.draftService.GetDraft(userID, uint(formID))
	if err != nil {
		schema.SendError(c, http.StatusNotFound, "draft not found")
		return
	}

	schema.SendSuccess(c, "get-draft", draft)
}

func (h *DraftHandler) DeleteDraft(c *gin.Context) {
	userID := c.GetUint("user_id")

	formIDStr := c.Param("formId")
	formID, err := strconv.ParseUint(formIDStr, 10, 64)
	if err != nil {
		schema.SendError(c, http.StatusBadRequest, "invalid form ID")
		return
	}

	err = h.draftService.DeleteDraft(userID, uint(formID))
	if err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	if err := h.dashboardService.UpdateUserFormStatus(userID, uint(formID), "available"); err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	schema.SendSuccess(c, "delete-draft", gin.H{
		"form_id": formID,
	})
}
