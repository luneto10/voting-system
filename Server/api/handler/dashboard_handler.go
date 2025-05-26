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
