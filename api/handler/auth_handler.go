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

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(c *gin.Context) {
	req := new(dto.CreateUserRequest)
	if ok := bindAndValidate(c, &req); !ok {
		return
	}

	user := new(model.User)
	if err := copier.Copy(user, req); err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	created, err := h.authService.Register(user)
	if err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	resp := new(dto.GetUserResponse)
	if err := copier.Copy(resp, created); err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	schema.SendSuccess(c, "register", resp)
}

func (h *AuthHandler) Login(c *gin.Context) {
	req := new(dto.LoginRequest)
	if ok := bindAndValidate(c, &req); !ok {
		return
	}

	user, token, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		schema.SendError(c, http.StatusUnauthorized, err.Error())
		return
	}

	c.SetCookie("token", token, 0, "/", "", false, true)

	resp := new(dto.GetUserResponse)
	if err := copier.Copy(resp, user); err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	schema.SendSuccess(c, "login", gin.H{
		"user":  resp,
		"token": token,
	})
}
