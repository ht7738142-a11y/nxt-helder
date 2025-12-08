import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Modèle User simplifié
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'admin' },
  twoFactorEnabled: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

async function createUser() {
  try {
    // Connexion à MongoDB
    const uri = 'mongodb+srv://nxtadmin:PGa2u5lBDYdHNVva@cluster0.ly9lkym.mongodb.net/nxt_helder?retryWrites=true&w=majority';
    console.log('Connexion à MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connecté à MongoDB');

    // Données utilisateur
    const email = 'helder.teixeira@outlook.be';
    const password = 'Test123456!';
    const name = 'Helder Teixeira';

    // Vérifier si l'utilisateur existe déjà
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('⚠️  Utilisateur existe déjà, mise à jour du mot de passe...');
      const hashedPassword = await bcrypt.hash(password, 10);
      existing.password = hashedPassword;
      await existing.save();
      console.log('✅ Mot de passe mis à jour !');
    } else {
      // Créer un nouvel utilisateur
      console.log('Création de l\'utilisateur...');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        twoFactorEnabled: false
      });

      await user.save();
      console.log('✅ Utilisateur créé avec succès !');
    }

    console.log('\n📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('\n✅ Tu peux maintenant te connecter sur le site !');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

createUser();
