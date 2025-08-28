#!/bin/bash

# install-musichopper.sh
# Script d'installation pour Linux

set -e

APP_NAME="MusicHopper"
APP_EXEC="musichopper"
VERSION="1.0.0"

echo "🎵 Installation de $APP_NAME v$VERSION"
echo "=================================="

# Détection de la distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$ID
elif [ -f /etc/redhat-release ]; then
    DISTRO="rhel"
else
    DISTRO="unknown"
fi

echo "Distribution détectée: $DISTRO"

# Fonction d'installation des dépendances
install_dependencies() {
    echo "📦 Installation des dépendances..."
    
    case $DISTRO in
        "ubuntu"|"debian"|"linuxmint")
            sudo apt update
            sudo apt install -y libgtk-3-0 libxss1 libasound2 libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxkbcommon0
            ;;
        "fedora"|"rhel"|"centos")
            sudo dnf install -y gtk3 libXScrnSaver alsa-lib libdrm libXcomposite libXdamage libXrandr mesa-libgbm libxkbcommon
            ;;
        "arch"|"manjaro")
            sudo pacman -S --needed gtk3 libxss alsa-lib libdrm libxcomposite libxdamage libxrandr mesa libxkbcommon
            ;;
        "opensuse"|"sles")
            sudo zypper install -y gtk3-devel libXScrnSaver1 alsa-lib libdrm2 libXcomposite1 libXdamage1 libXrandr2 Mesa-libgbm1
            ;;
        *)
            echo "⚠️  Distribution non reconnue. Vous devrez installer les dépendances manuellement."
            echo "Dépendances requises: GTK3, ALSA, libdrm, libXcomposite, libXdamage, libXrandr"
            ;;
    esac
}

# Installation des dépendances
install_dependencies

# Créer les dossiers nécessaires
echo "📁 Création des dossiers..."
mkdir -p ~/.local/bin
mkdir -p ~/.local/share/applications
mkdir -p ~/.local/share/icons/hicolor/512x512/apps

# Copier les fichiers (adaptez selon votre structure)
echo "📋 Copie des fichiers..."

# Si vous avez une AppImage
if [ -f "MusicHopper.AppImage" ]; then
    cp MusicHopper.AppImage ~/.local/bin/musichopper
    chmod +x ~/.local/bin/musichopper
    echo "✅ AppImage installée"
fi

# Copier l'icône
if [ -f "assets/musicHopper.png" ]; then
    cp assets/musicHopper.png ~/.local/share/icons/hicolor/512x512/apps/musichopper.png
    echo "✅ Icône installée"
fi

# Créer le fichier .desktop
cat > ~/.local/share/applications/musichopper.desktop << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=MusicHopper
GenericName=Music Player
Comment=Modern and elegant music player
Icon=musichopper
TryExec=musichopper
Exec=musichopper %F
NoDisplay=false
Categories=AudioVideo;Audio;Player;
Keywords=music;audio;player;mp3;flac;ogg;sound;
MimeType=audio/mpeg;audio/flac;audio/ogg;audio/wav;audio/x-wav;audio/mp4;audio/aac;audio/opus;
StartupNotify=true
StartupWMClass=MusicHopper
Terminal=false
EOF

echo "✅ Fichier .desktop créé"

# Mettre à jour la base de données des applications
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database ~/.local/share/applications
    echo "✅ Base de données des applications mise à jour"
fi

# Mettre à jour le cache des icônes
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache ~/.local/share/icons/hicolor
    echo "✅ Cache des icônes mis à jour"
fi

# Ajouter ~/.local/bin au PATH si nécessaire
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo "📝 Ajout de ~/.local/bin au PATH"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
    echo "⚠️  Redémarrez votre terminal ou exécutez: source ~/.bashrc"
fi

echo ""
echo "🎉 Installation terminée !"
echo "✅ MusicHopper est maintenant installé"
echo "📱 Recherchez 'MusicHopper' dans votre menu d'applications"
echo "💻 Ou lancez directement avec: musichopper"
echo ""
echo "🔧 Pour désinstaller:"
echo "   rm ~/.local/bin/musichopper"
echo "   rm ~/.local/share/applications/musichopper.desktop"
echo "   rm ~/.local/share/icons/hicolor/512x512/apps/musichopper.png"