# Condica HLRO


This is a web application for tracking the check in and check out time of HLRO employees in accordance to work law in Romania.

The web app is integrated with Active Directory so you should be automatically logged in while in the company domain network or you might have to enter your domain credentials manually.

By default it will show the entry for today and will automatically initialize it with the current time for checkin. 

You may generate a set of URLs that are unique for your user so that you can automate the process of entering check in and check out times.



## Automate it !!!

If you want to automate the check-in and check-out times you may use the Webhook URLs in whatever way you want. An example can be seen below on how to configure an IFTTT applet for automatically checking in when your smartphone connects to the work wifi network.


![IFTTT Tutorial](/public/images/Ifttt_condica.gif)


## TODO List

-  not before 7, not after 22:00
-  interval not larger than 10 hours - shift checkin time to compensate
-  send email for errors/warning
-  send email if someone checked in more than 10 hours ago