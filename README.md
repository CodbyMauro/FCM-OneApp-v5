# Cordova Plugin: Change Notification Icon

This Cordova plugin allows you to automatically customize the notification icon and color for Firebase Cloud Messaging notifications in Android.

Plugin ID

cordova-plugin-change-notification-icon

# Features

	•	Automatically adds the necessary meta-data entries to the AndroidManifest.xml for setting Firebase notification icon and color.
	•	Customizable icon and color for notifications.

# Installation

	1.	Add the plugin to your Cordova project:

  cordova plugin add path/to/cordova-plugin-change-notification-icon --variable NOTIFICATION_COLOR="#4CAF50"

  2. or if the plugin is hosted on a repository (such as GitHub):
cordova plugin add https://github.com/your-repo/cordova-plugin-change-notification-icon --variable NOTIFICATION_COLOR="#4CAF50"


# Usage

1. Adding the Notification Icon

To add the notification icon to your app, follow these steps:

	1.	Prepare your icon with the name notification_icon.png.
	2.	Create a ZIP file containing all the necessary drawable folders (drawable-mdpi, drawable-hdpi, etc.) with the notification_icon.png image in each one.
	3.	Upload the ZIP file to Outsystems Resources or place it directly in your Cordova project under the res folder.


The strucuture should look like this:

  res/
	│
	├── drawable-mdpi/
	│   └── notification_icon.png
	├── drawable-hdpi/
	│   └── notification_icon.png
	├── drawable-xhdpi/
	│   └── notification_icon.png
	├── drawable-xxhdpi/
	│   └── notification_icon.png
	└── drawable-xxxhdpi/
		└── notification_icon.png

