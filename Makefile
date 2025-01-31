all: clean run

run:
	docker compose up --build

clean:
	docker compose down -t0 --remove-orphans
	docker compose rm -f

clean-data:
	rm -rf ./volumes