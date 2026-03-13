.PHONY: build dashboard dev clean

build: dashboard
	go build -o engram ./cmd/engram

dashboard:
	npm --prefix dashboard ci
	npm --prefix dashboard run build

dev:
	npm --prefix dashboard run dev

clean:
	rm -f engram
	rm -f internal/server/dist/index.html
	rm -rf internal/server/dist/assets
