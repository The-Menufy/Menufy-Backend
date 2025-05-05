const { generateVerificationLink } = require("/projetPIBackend/the-menufy-backend/src/utils/jwt");

class SignupService {
    // Génère un token de vérification sans envoyer d'email
    generateVerificationToken(userEmail) {
        // Générer un lien de vérification avec un token d'accès
        const verificationToken = generateVerificationLink(userEmail);

        return verificationToken;
    }
}

module.exports = new SignupService();
