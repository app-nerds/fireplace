#!/usr/bin/env bash

#
# This script will compile and deploy Fireplace Server and Viewer
# to a Linux-based system. It uses SSH to deploy.
#
# Usage:
# ./deploy.sh -t address.location.com
#
# Arguments:
#   * -t (--target) - Target server to deploy to. Required
#   * -d (--directory) - Target server directory. Required
#   * -n (--no-build) - Don't compile. Optional. Defaults to build
#

if [ "$#" -lt 4 ]; then
	echo "Please provide a target server and directory to deploy to"
	echo "Example: ./deploy.sh -t target.server.com -d /opt/directory"
	exit 1
fi

PERFORMBUILD=true

#
# Get the command line args
#
while [[ $# > 1 ]]
do
	key="$1"

	case $key in
		-t|--target)
			TARGET="$2"
			shift
			;;

		-d|--directory)
			DIRECTORY="$2"
			shift
			;;

		-n|--no-build)
			PERFORMBUILD=false
			shift
			;;
	esac

	shift
done

#
# Remove a previous builds
#
if [ "$PERFORMBUILD" = true ]; then
	echo "Removing previous builds..."

	if [ -f "../cmd/fireplace-server/fireplace-server" ]; then
		rm ../cmd/fireplace-server/fireplace-server
	fi

	if [ -f "../cmd/fireplace-viewer/fireplace-viewer" ]; then
		rm ../cmd/fireplace-viewer/fireplace-viewer
	fi

	#
	# Generate and build
	#
	echo "Compiling..."

	export GOOS=linux
	export GOARCH=amd64

	cd ../cmd/fireplace-server
	go build

	cd ../fireplace-viewer
	make prod

	cd ../../bin
fi

#
# Copy it up
#
echo "Stopping services..."
ssh $TARGET 'bash -s' <<-'ENDSSH'
	systemctl stop fireplace-viewer
	systemctl stop fireplace-server
ENDSSH

echo "Deploying..."
scp ../cmd/fireplace-server/fireplace-server $TARGET:$DIRECTORY
scp ../cmd/fireplace-viewer/fireplace-viewer $TARGET:$DIRECTORY

echo "Adjusting permissions and starting service..."

ssh $TARGET 'bash -s' <<-ENDSSH
	chown -R fireplace: $DIRECTORY
	setcap 'cap_net_bind_service=+ep' $DIRECTORY/fireplace-server
	setcap 'cap_net_bind_service=+ep' $DIRECTORY/fireplace-viewer
	systemctl start fireplace-server
	systemctl start fireplace-viewer
ENDSSH

echo "Done."