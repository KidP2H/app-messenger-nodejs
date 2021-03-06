import UserModel from "../models/userModel"
import bcrypt from "bcrypt";
import uuid from "uuid/v4"
import sendMailUser from "../config/mailer"
import {transErrors} from "../lang/vi"
import {transSuccess} from "../lang/vi"

//define bcrypt to encrypt password
const saltRounds = 10;
let salt = bcrypt.genSaltSync(saltRounds)

var registerUser = async(email, password, gender, protocol, host) => {
    let checkEmail = await UserModel.findEmail(email)
    if (checkEmail) {
        return transErrors.emailExist
        if (checkEmail.local.isActive === false) {
            return transErrors.unActive
        } else if (checkEmail.deletedAt != null) {
            return transErrors.userDeleted
        }
    } else {
        let listItem = {
            username: email.split("@")[0],
            gender: gender,
            local: {
                email: email,
                password: bcrypt.hashSync(password, salt),
                verifyToken: uuid(),
            }

        }
        let result = await UserModel.createNewRecord(listItem) // insert user to database
        let linkActive = `${protocol}://${host}/users/active/${listItem.local.verifyToken}` //declare link active to send mail user to active account
        sendMailUser(email, transSuccess.subject, transSuccess.htmlContent(linkActive)) // send mail
    }
}

var activeUser = async(codeActive) => {
    let action = await UserModel.active(codeActive)
    if (action === null) {
        return transErrors.errorActive
    }
}


module.exports = {
    registerUser: registerUser,
    activeUser: activeUser
}
