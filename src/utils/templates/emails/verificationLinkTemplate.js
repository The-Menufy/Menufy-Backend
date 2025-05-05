const verificationLinkTemplate = (resetLink) => {
  return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 400px;
                    margin: 20px auto;
                    background-color: white;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .wave-top {
                    height: 100px;
                    background-color: #FFC0CB;
                    border-radius: 0 0 50% 50%;
                    margin-bottom: -50px;
                }
                .content {
                    padding: 30px;
                    text-align: center;
                }
                .icon-circle {
                    width: 60px;
                    height: 60px;
                    background-color: #FFC0CB;
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .icon-circle span {
                    font-size: 30px;
                }
                h2 {
                    color: #333;
                    margin-bottom: 10px;
                    font-size: 20px;
                }
                p {
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 25px;
                    line-height: 1.5;
                }
                .button {
                    display: inline-block;
                    padding: 12px 30px;
                    background-color: #FFC0CB;
                    color: white;
                    text-decoration: none;
                    border-radius: 25px;
                    font-weight: bold;
                    margin: 20px 0;
                    transition: background-color 0.3s;
                }
                .button:hover {
                    background-color: #FFB6C1;
                }
                .resend {
                    font-size: 12px;
                    color: #666;
                }
                .resend a {
                    color: #FFC0CB;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="wave-top"></div>
                <div class="content">
                    <div class="icon-circle">
                        <span>✉️</span>
                    </div>
                    <h2>Check your inbox, please!</h2>
                    <p>Hey, we just sent you verification link, we need to verify your email address. Please check it and confirm it's really you!</p>
                    <a href="${resetLink}" target="_blank" class="button">Verify</a>
                    <p class="resend">
                        Didn't get an email? <a href="#">Send it again</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
};
module.exports = verificationLinkTemplate;
