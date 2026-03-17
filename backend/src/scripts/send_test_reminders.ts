import { sendPaymentReminderEmail } from "../services/emailService.js";
import { pool } from "../database/pool.js";

async function run() {
  const targetEmail = "veleonacademy@gmail.com";
  const firstName = "Academy Owner";
  
  console.log(`Sending test emails to ${targetEmail}...`);
  
  try {
    console.log("- Sending 1h reminder...");
    await sendPaymentReminderEmail(targetEmail, firstName, "1h");
    
    console.log("- Sending 24h reminder...");
    await sendPaymentReminderEmail(targetEmail, firstName, "24h");
    
    console.log("- Sending 72h reminder...");
    await sendPaymentReminderEmail(targetEmail, firstName, "72h");
    
    console.log("✅ All test emails sent successfully.");
  } catch (err) {
    console.error("❌ Error sending test emails:", err);
  } finally {
    // Small delay to ensure logs are flushed
    setTimeout(async () => {
        await pool.end();
        process.exit(0);
    }, 1000);
  }
}

run();
