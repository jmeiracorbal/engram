package server

import (
	"embed"
	"io/fs"
	"mime"
	"net/http"
	"path"
	"strings"
)

//go:embed all:dist
var dashboardFS embed.FS

func (s *Server) serveDashboard() {
	s.mux.HandleFunc("GET /{$}", s.dashboardHandler)
	s.mux.HandleFunc("GET /{path...}", s.dashboardHandler)
}

func (s *Server) dashboardHandler(w http.ResponseWriter, r *http.Request) {
	reqPath := strings.TrimPrefix(r.URL.Path, "/")
	if reqPath == "" {
		if s.serveDashboardFile(w, "dist/index.html") {
			return
		}
		jsonError(w, http.StatusNotFound, "dashboard not included in this build; run 'make build' from the project root")
		return
	}
	cleanPath := path.Clean(reqPath)
	if strings.Contains(cleanPath, "..") {
		http.NotFound(w, r)
		return
	}
	embedPath := "dist/" + cleanPath
	if s.serveDashboardFile(w, embedPath) {
		return
	}
	if s.serveDashboardFile(w, "dist/index.html") {
		return
	}
	jsonError(w, http.StatusNotFound, "dashboard not included in this build; run 'make build' from the project root")
}

func (s *Server) serveDashboardFile(w http.ResponseWriter, name string) bool {
	data, err := fs.ReadFile(dashboardFS, name)
	if err != nil {
		return false
	}
	ext := path.Ext(name)
	ct := mime.TypeByExtension(ext)
	if ct == "" {
		ct = "application/octet-stream"
	}
	w.Header().Set("Content-Type", ct)
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(data)
	return true
}
