FROM alpine/git AS clone
WORKDIR /app
RUN git clone https://github.com/TIHBS/blockchain-access-layer-fabric-plugin.git
RUN git clone https://github.com/TIHBS/blockchain-access-layer-ethereum-plugin.git
RUN git clone https://github.com/ghareeb-falazi/BlockchainAccessLayer

FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY --from=clone /app/BlockchainAccessLayer /app/BlockchainAccessLayer
COPY --from=clone /app/blockchain-access-layer-fabric-plugin /app/blockchain-access-layer-fabric-plugin
COPY --from=clone /app/blockchain-access-layer-ethereum-plugin /app/blockchain-access-layer-ethereum-plugin
COPY /config/application.properties /app/BlockchainAccessLayer/src/main/resources
RUN mvn -f ./blockchain-access-layer-fabric-plugin/pom.xml package -DskipTests
RUN mvn -f ./blockchain-access-layer-ethereum-plugin/pom.xml package -DskipTests
RUN mvn -f ./BlockchainAccessLayer/pom.xml package -DskipTests

FROM eclipse-temurin:17 AS scip-gateway
COPY --from=build /app/blockchain-access-layer-fabric-plugin/target/blockchain-access-layer-fabric-plugin-3.0.4-plugin.jar /root/plugins/
COPY --from=build /app/blockchain-access-layer-ethereum-plugin/target/blockchain-access-layer-ethereum-plugin-3.0.4-plugin.jar /root/plugins/
COPY --from=build /app/BlockchainAccessLayer/target/*.jar app.jar
COPY /config/connectionProfiles.json /root/.bal/
ENTRYPOINT ["java","-jar","/app.jar"]