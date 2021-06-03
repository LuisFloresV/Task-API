const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
// sgMail.send({
//   to: 'naokodeveloper@gmail.com',
//   from: 'naokodeveloper@gmail.com',
//   subject: 'This is my first creation',
//   text: 'Testing sendgrid'
// })

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'naokodeveloper@gmail.com',
    subject: 'Welcome to the Task App :)',
    text: `Welcome to the app, ${name}. Let me know how yo get along with the app.`,
  })
}

const sendCancelEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'naokodeveloper@gmail.com',
    subject: `Goodbye ${name} ;( `,
    text: `Bad news, ${name}. Let us know why are you leaving. Until the next time!`,
  })
}

module.exports = { sendWelcomeEmail, sendCancelEmail }
