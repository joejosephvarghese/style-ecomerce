const experss = require("express");
const router = experss.Router();
const {
  handleOtpSending,
  handleVerifyOtp,
} = require("../controllers/userOtpLoginController");

router.route("/send-otp").post(handleOtpSending);

router.route("/verify-otp").post(handleVerifyOtp);

module.exports = router;
