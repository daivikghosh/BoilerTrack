from app import send_mail


if __name__ == '__main__':
    email = 'dbenesma@purdue.edu'
    message = 'This is a test email from the Purdue CS307 project'
    pair = [(email, message)]
    send_mail(pair, "BOILERTRACK: test email")
