FROM golang:latest

WORKDIR /app

COPY ./ /app

RUN go mod download

RUN apt-get update && apt-get install -y libaio1 wget unzip
RUN go get github.com/githubnemo/CompileDaemon
RUN go get gopkg.in/goracle.v2

WORKDIR /opt/oracle

RUN wget https://download.oracle.com/otn_software/linux/instantclient/instantclient-basiclite-linuxx64.zip && \
    unzip instantclient-basiclite-linuxx64.zip && \
    rm -f instantclient-basiclite-linuxx64.zip && \
    cd instantclient* && \
    rm -f *jdbc* *occi* *mysql* *jar uidrvci genezi adrci && \
    echo /opt/oracle/instantclient* > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig

WORKDIR /app/cmd/receiver/

ENTRYPOINT CompileDaemon --build="go build main.go" --command=./main
