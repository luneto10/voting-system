package handler

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/copier"
	"github.com/luneto10/voting-system/api/dto"
	"github.com/luneto10/voting-system/api/model"
	"github.com/luneto10/voting-system/internal/schema"
	"github.com/luneto10/voting-system/internal/service"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
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

	user, jwtToken, refreshToken, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		schema.SendError(c, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	userResp := new(dto.GetUserResponse)
	if err := copier.Copy(userResp, user); err != nil {
		schema.SendError(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Definindo domínio corretamente
	domain := ""
	prodDomain := "voting-system-pcy5.onrender.com"
	secure := false
	if os.Getenv("GIN_MODE") == "release" {
		domain = prodDomain
		secure = true
	}

	log.Printf("Setting cookie with domain: %s, secure: %v, httpOnly: true", domain, secure)

	// Configurando SameSite=None manualmente (usando Header direto, por garantia)
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "token",
		Value:    jwtToken,
		Path:     "/",
		Domain:   domain,
		MaxAge:   7 * 24 * 60 * 60,
		Secure:   secure,
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
	})

	resp := &dto.LoginResponse{
		User:         *userResp,
		AccessToken:  jwtToken,
		RefreshToken: refreshToken,
	}

	schema.SendSuccess(c, "login", resp)
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	req := new(dto.RefreshTokenRequest)
	if ok := bindAndValidate(c, &req); !ok {
		return
	}

	newJWT, err := h.authService.RefreshToken(req.RefreshToken)
	if err != nil {
		schema.SendError(c, http.StatusUnauthorized, "Invalid refresh token")
		return
	}

	domain := ""
	prodDomain := "voting-system-pcy5.onrender.com"
	secure := false
	if os.Getenv("GIN_MODE") == "release" {
		domain = prodDomain
		secure = true
	}

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "token",
		Value:    newJWT,
		Path:     "/",
		Domain:   domain,
		MaxAge:   7 * 24 * 60 * 60,
		Secure:   secure,
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
	})

	resp := &dto.RefreshTokenResponse{
		AccessToken: newJWT,
	}

	schema.SendSuccess(c, "refresh", resp)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	req := new(dto.LogoutRequest)
	if ok := bindAndValidate(c, &req); !ok {
		return
	}

	if err := h.authService.Logout(req.RefreshToken); err != nil {
		schema.SendError(c, http.StatusInternalServerError, "Failed to logout")
		return
	}

	domain := ""
	prodDomain := "voting-system-pcy5.onrender.com"
	secure := false
	if os.Getenv("GIN_MODE") == "release" {
		domain = prodDomain
		secure = true
	}

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		Domain:   domain,
		MaxAge:   -1,
		Secure:   secure,
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
	})

	schema.SendSuccess(c, "logout", nil)
}