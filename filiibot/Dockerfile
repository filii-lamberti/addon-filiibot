ARG BUILD_FROM=hassioaddons/base:7.2.0
# hadolint ignore=DL3006
FROM ${BUILD_FROM}

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Copy root filesystem
COPY rootfs/etc /etc/
COPY \
    rootfs/opt/filiibot/package.json \
    rootfs/opt/filiibot/yarn.lock \
    /opt/filiibot/

# Setup base
# hadolint ignore=DL3003
RUN \
    apk add --no-cache --virtual .build-dependencies \
        build-base=0.5-r1 \
        npm=12.15.0-r1 \
        python2=2.7.18-r0 \
        yarn=1.19.2-r0 \
    \
    && apk add --no-cache \
        ffmpeg=4.2.1-r3 \
        nodejs=12.15.0-r1 \
    \
    && cd /opt/filiibot \
    \
    && yarn global add modclean \
    && yarn --production \
    \
    && modclean \
        --path /opt/filiibot \
        --no-progress \
        --keep-empty \
        --run \
    \
    && yarn global remove modclean \
    && yarn cache clean \
    \
    && apk del --no-cache --purge .build-dependencies

COPY \
    rootfs/opt/filiibot/bot.js \
    rootfs/opt/filiibot/welcomeDm.txt \
    /opt/filiibot/

# Build arguments
ARG BUILD_ARCH
ARG BUILD_DATE
ARG BUILD_REF
ARG BUILD_VERSION

# Labels
LABEL \
    io.hass.name="Filiibot" \
    io.hass.description="A Filiibot add-on for Home Assistant" \
    io.hass.arch="${BUILD_ARCH}" \
    io.hass.type="addon" \
    io.hass.version=${BUILD_VERSION} \
    maintainer="Jorim Tielemans <tielemans.jorim@gmail.com>" \
    org.opencontainers.image.title="Filiibot" \
    org.opencontainers.image.description="A Filiibot add-on for Home Assistant" \
    org.opencontainers.image.vendor="Filii Lamberti" \
    org.opencontainers.image.authors="Jorim Tielemans <tielemans.jorim@gmail.com>" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.url="https://filii.be" \
    org.opencontainers.image.source="https://gitlab.com/filii-lamberti/addon-filiibot" \
    org.opencontainers.image.documentation="https://gitlab.com/filii-lamberti/addon-filiibot" \
    org.opencontainers.image.created=${BUILD_DATE} \
    org.opencontainers.image.revision=${BUILD_REF} \
    org.opencontainers.image.version=${BUILD_VERSION}