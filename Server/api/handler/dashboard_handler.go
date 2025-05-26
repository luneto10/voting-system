package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/copier"
	"github.com/luneto10/voting-system/api/dto"
	"github.com/luneto10/voting-system/internal/schema"
	"github.com/luneto10/voting-system/internal/service"
)

type DashboardHandler struct {
	dashboardService service.DashboardService
}

func NewDashboardHandler(dashboardService service.DashboardService) *DashboardHandler {
	return &DashboardHandler{
		dashboardService: dashboardService,
	}
}

func (h *DashboardHandler) GetDashboard(c *gin.Context) {
	userID := c.GetUint("user_id")

	dashboardData, err := h.dashboardService.GetDashboardData(userID)
	if err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	response := dto.DashboardResponse{}
	if err := copier.Copy(&response, dashboardData); err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	schema.SendSuccess(c, "dashboard-data", response)
}

func (h *DashboardHandler) UpdateFormStatus(c *gin.Context) {
	userID := c.GetUint("user_id")

	formIDStr := c.Param("formId")
	formID, err := strconv.ParseUint(formIDStr, 10, 64)
	if err != nil {
		schema.SendError(c, http.StatusBadRequest, "invalid form ID")
		return
	}

	status := c.Param("status")
	if status != "available" && status != "in_progress" && status != "completed" {
		schema.SendError(c, http.StatusBadRequest, "invalid status. Must be one of: available, in_progress, completed")
		return
	}

	err = h.dashboardService.UpdateUserFormStatus(userID, uint(formID), status)
	if err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	schema.SendSuccess(c, "update-form-status", gin.H{
		"form_id": formID,
		"status":  status,
	})
}

func (h *DashboardHandler) DeleteFormParticipation(c *gin.Context) {
	userID := c.GetUint("user_id")
	formID, err := strconv.ParseUint(c.Param("formId"), 10, 32)
	if err != nil {
		schema.SendError(c, http.StatusBadRequest, "invalid form ID")
		return
	}

	err = h.dashboardService.DeleteFormParticipation(userID, uint(formID))
	if err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	schema.SendSuccess(c, "delete-form-participation", gin.H{
		"form_id": formID,
	})
}

func (h *DashboardHandler) GetUserActivities(c *gin.Context) {
	userID := c.GetUint("user_id")
	status := c.DefaultQuery("status", "all")
	page := c.DefaultQuery("page", "1")
	perPage := c.DefaultQuery("per_page", "10")

	pageNum, err := strconv.Atoi(page)
	if err != nil || pageNum < 1 {
		pageNum = 1
	}

	perPageNum, err := strconv.Atoi(perPage)
	if err != nil || perPageNum < 1 {
		perPageNum = 10
	}

	activities, total, err := h.dashboardService.GetUserActivities(userID, status, pageNum, perPageNum)
	if err != nil {
		schema.SendError(c, http.StatusInternalServerError, "failed to get user activities")
		return
	}

	schema.SendSuccess(c, "user-activities", gin.H{
		"data":     activities,
		"total":    total,
		"page":     pageNum,
		"per_page": perPageNum,
	})
}
