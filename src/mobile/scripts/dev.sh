#!/bin/bash

# Script para desenvolvimento do CarbonDrive Mobile

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_message() {
    echo -e "${BLUE}[CarbonDrive Mobile]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para mostrar ajuda
show_help() {
    echo "CarbonDrive Mobile Development Script"
    echo ""
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start           Iniciar servidor de desenvolvimento"
    echo "  web             Executar no navegador"
    echo "  ios             Executar no iOS (requer macOS)"
    echo "  android         Executar no Android"
    echo "  doctor          Verificar configuração do projeto"
    echo "  install         Instalar dependências"
    echo "  clean           Limpar cache e node_modules"
    echo "  build           Build para produção"
    echo "  help            Mostrar esta ajuda"
}

# Função para verificar dependências
check_dependencies() {
    print_message "Verificando dependências..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js não está instalado. Por favor, instale o Node.js primeiro."
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm não está instalado. Por favor, instale o npm primeiro."
        exit 1
    fi
    
    # Verificar Expo CLI
    if ! command -v npx &> /dev/null; then
        print_error "npx não está disponível. Por favor, instale o npm primeiro."
        exit 1
    fi
    
    print_success "Todas as dependências estão instaladas!"
}

# Função para instalar dependências
install_dependencies() {
    print_message "Instalando dependências..."
    npm install
    npx expo install --check
    print_success "Dependências instaladas com sucesso!"
}

# Função para limpar cache
clean_project() {
    print_message "Limpando cache e node_modules..."
    rm -rf node_modules
    rm -rf .expo
    npm cache clean --force
    print_success "Cache limpo com sucesso!"
}

# Função para verificar projeto
check_project() {
    print_message "Verificando configuração do projeto..."
    npx expo-doctor
}

# Função para iniciar desenvolvimento
start_dev() {
    print_message "Iniciando servidor de desenvolvimento..."
    print_warning "Certifique-se de ter o Expo Go instalado no seu dispositivo!"
    npx expo start
}

# Função para executar no web
run_web() {
    print_message "Executando no navegador..."
    npx expo start --web
}

# Função para executar no iOS
run_ios() {
    print_message "Executando no iOS..."
    npx expo run:ios
}

# Função para executar no Android
run_android() {
    print_message "Executando no Android..."
    npx expo run:android
}

# Função para build
build_project() {
    print_message "Fazendo build para produção..."
    npx expo build
}

# Main
case "${1:-help}" in
    start)
        check_dependencies
        start_dev
        ;;
    web)
        check_dependencies
        run_web
        ;;
    ios)
        check_dependencies
        run_ios
        ;;
    android)
        check_dependencies
        run_android
        ;;
    doctor)
        check_project
        ;;
    install)
        install_dependencies
        ;;
    clean)
        clean_project
        ;;
    build)
        check_dependencies
        build_project
        ;;
    help|*)
        show_help
        ;;
esac
