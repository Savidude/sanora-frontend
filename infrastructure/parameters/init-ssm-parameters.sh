#!/bin/bash

# SSM Parameter Store Initialization Script
# 
# This script initializes required SSM parameters for the Sanora application
# Run this script once during initial setup or when parameters need to be updated

set -e

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-development}"
PREFIX="/sanora"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    log_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if jq is installed (for JSON parsing)
if ! command -v jq &> /dev/null; then
    log_warning "jq is not installed. Install it for better JSON handling."
fi

log_info "Initializing SSM parameters for Sanora application"
log_info "Environment: $ENVIRONMENT"
log_info "AWS Region: $AWS_REGION"
log_info "Parameter Prefix: $PREFIX"

# Function to create or update SSM parameter
create_or_update_parameter() {
    local param_name=$1
    local param_value=$2
    local param_type=${3:-String}
    local description=$4

    log_info "Setting parameter: $param_name"

    # Check if parameter exists
    if aws ssm get-parameter --name "$param_name" --region "$AWS_REGION" &> /dev/null; then
        log_warning "Parameter $param_name already exists. Updating..."
        aws ssm put-parameter \
            --name "$param_name" \
            --value "$param_value" \
            --type "$param_type" \
            --description "$description" \
            --overwrite \
            --region "$AWS_REGION"
    else
        log_info "Creating new parameter: $param_name"
        aws ssm put-parameter \
            --name "$param_name" \
            --value "$param_value" \
            --type "$param_type" \
            --description "$description" \
            --region "$AWS_REGION"
    fi

    if [ $? -eq 0 ]; then
        log_info "Successfully set parameter: $param_name"
    else
        log_error "Failed to set parameter: $param_name"
        exit 1
    fi
}

# Prompt for parameter values
read -p "Enter API Gateway URL (e.g., https://api.sanora.app/v1): " API_GATEWAY_URL
read -p "Enter Cognito User Pool ID (e.g., us-east-1_XXXXXXXXX): " COGNITO_USER_POOL_ID
read -p "Enter Cognito App Client ID: " COGNITO_CLIENT_ID

# Validate inputs
if [ -z "$API_GATEWAY_URL" ] || [ -z "$COGNITO_USER_POOL_ID" ] || [ -z "$COGNITO_CLIENT_ID" ]; then
    log_error "All parameters are required. Please try again."
    exit 1
fi

# Create parameters
create_or_update_parameter \
    "$PREFIX/api-gateway-url" \
    "$API_GATEWAY_URL" \
    "String" \
    "API Gateway base URL for Sanora application"

create_or_update_parameter \
    "$PREFIX/cognito-user-pool-id" \
    "$COGNITO_USER_POOL_ID" \
    "String" \
    "AWS Cognito User Pool ID for authentication"

create_or_update_parameter \
    "$PREFIX/cognito-client-id" \
    "$COGNITO_CLIENT_ID" \
    "String" \
    "AWS Cognito App Client ID for authentication"

# Create environment-specific parameters if needed
if [ "$ENVIRONMENT" != "development" ]; then
    log_info "Creating environment-specific parameters for $ENVIRONMENT"
    
    create_or_update_parameter \
        "$PREFIX/$ENVIRONMENT/api-gateway-url" \
        "$API_GATEWAY_URL" \
        "String" \
        "API Gateway URL for $ENVIRONMENT environment"
    
    create_or_update_parameter \
        "$PREFIX/$ENVIRONMENT/cognito-user-pool-id" \
        "$COGNITO_USER_POOL_ID" \
        "String" \
        "Cognito User Pool ID for $ENVIRONMENT environment"
    
    create_or_update_parameter \
        "$PREFIX/$ENVIRONMENT/cognito-client-id" \
        "$COGNITO_CLIENT_ID" \
        "String" \
        "Cognito App Client ID for $ENVIRONMENT environment"
fi

log_info "All parameters initialized successfully!"
log_info ""
log_info "To verify parameters, run:"
log_info "aws ssm get-parameters-by-path --path $PREFIX --region $AWS_REGION"
log_info ""
log_info "To delete all parameters, run:"
log_info "aws ssm delete-parameters --names $PREFIX/api-gateway-url $PREFIX/cognito-user-pool-id $PREFIX/cognito-client-id --region $AWS_REGION"
