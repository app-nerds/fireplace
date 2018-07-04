package main

import (
	"fmt"
	"html/template"
	"io"
	"path/filepath"
	"strings"

	"github.com/adampresley/fireplace/cmd/fireplace-viewer/www"
	"github.com/labstack/echo"
)

var templates map[string]*template.Template
var pageList = []string{
	"main-page.gohtml",
	"delete-old-entries.gohtml",
}

/*
TemplateRenderer describes a handlers for rendering layouts/pages
*/
type TemplateRenderer struct {
	templates *template.Template
}

/*
NewTemplateRenderer creates a new struct
*/
func NewTemplateRenderer(debugMode bool) *TemplateRenderer {
	result := &TemplateRenderer{}
	result.LoadTemplates(debugMode)

	return result
}

func (t *TemplateRenderer) Render(w io.Writer, name string, data interface{}, ctx echo.Context) error {
	var tmpl *template.Template
	var ok bool
	var err error

	if tmpl, ok = templates[name]; !ok {
		return fmt.Errorf("Cannot find template %s", name)
	}

	if err = tmpl.ExecuteTemplate(w, "layout", data); err != nil {
		fmt.Printf("Error executing template %s: %s", name, err.Error())
	}

	return err
}

func (t *TemplateRenderer) LoadTemplates(debugMode bool) {
	templates = make(map[string]*template.Template)
	var err error

	for _, fileName := range pageList {
		trimmedName := strings.TrimSuffix(fileName, filepath.Ext(fileName))

		if templates["mainLayout:"+trimmedName], err = template.Must(
			template.New("layout").Parse(www.FSMustString(debugMode, "/www/fireplace-viewer/layouts/mainLayout.gohtml")),
		).Parse(www.FSMustString(debugMode, "/www/fireplace-viewer/pages/"+fileName)); err != nil {
			panic("Error parsing template " + fileName + ": " + err.Error())
		}
	}
}
