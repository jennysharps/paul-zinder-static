---
title: Contact
layout: form
form_action: "https://us-central1-paul-zinder.cloudfunctions.net/send-email"
form_fields:
    - name: name
      label: Name
      type: text
      required: true
    - name: email
      label: Email
      type: email
      required: true
    - name: message
      label: Message
      type: textarea
      required: true
form_submit_text: Send
---
