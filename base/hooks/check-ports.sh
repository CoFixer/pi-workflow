#!/bin/bash
# Port Conflict Checker
# Checks if common development ports are in use and offers to kill zombie processes
#
# Usage: .pi/hooks/check-ports.sh [--kill] [--port PORT]
#   --kill    Automatically kill processes on conflicting ports
#   --port    Check specific port (default: checks 3000, 5173, 5174)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default ports to check
DEFAULT_PORTS=(3000 5173 5174)
KILL_MODE=false
SPECIFIC_PORT=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --kill)
            KILL_MODE=true
            shift
            ;;
        --port)
            SPECIFIC_PORT="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# Determine which ports to check
if [[ -n "$SPECIFIC_PORT" ]]; then
    PORTS=("$SPECIFIC_PORT")
else
    PORTS=("${DEFAULT_PORTS[@]}")
fi

check_port() {
    local port=$1
    local pid=$(lsof -ti :$port 2>/dev/null | head -1)

    if [[ -n "$pid" ]]; then
        local process_info=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")

        # Check if process is responsive (try a quick HTTP request)
        local is_responsive=false
        if curl -s --max-time 2 "http://localhost:$port" >/dev/null 2>&1; then
            is_responsive=true
        fi

        if $is_responsive; then
            echo -e "${GREEN}Port $port: In use by '$process_info' (PID $pid) - RESPONSIVE${NC}"
            return 0
        else
            echo -e "${YELLOW}Port $port: In use by '$process_info' (PID $pid) - NOT RESPONDING (zombie?)${NC}"

            if $KILL_MODE; then
                echo -e "${RED}Killing process $pid on port $port...${NC}"
                kill -9 $pid 2>/dev/null || true
                sleep 1

                # Verify it's dead
                if lsof -ti :$port >/dev/null 2>&1; then
                    echo -e "${RED}Failed to kill process on port $port${NC}"
                    return 1
                else
                    echo -e "${GREEN}Port $port is now free${NC}"
                    return 0
                fi
            else
                echo -e "${YELLOW}Run with --kill to terminate, or manually: kill -9 $pid${NC}"
                return 1
            fi
        fi
    else
        echo -e "${GREEN}Port $port: Available${NC}"
        return 0
    fi
}

echo "=== Port Conflict Checker ==="
echo ""

has_issues=false
for port in "${PORTS[@]}"; do
    if ! check_port $port; then
        has_issues=true
    fi
done

echo ""

if $has_issues && ! $KILL_MODE; then
    echo -e "${YELLOW}Some ports have issues. Run with --kill to auto-fix:${NC}"
    echo "  .pi/hooks/check-ports.sh --kill"
    exit 1
else
    echo -e "${GREEN}All ports ready for development${NC}"
    exit 0
fi
