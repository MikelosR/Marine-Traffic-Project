package com.seax.back.config;

import com.seax.back.model.User;
import com.seax.back.repository.UserRepository;
import com.seax.back.service.PasswordService;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder {

    private final UserRepository userRepository;

    private final PasswordService passwordService;

    public AdminSeeder(UserRepository userRepository, PasswordService passwordService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
    }

    //This runs when Spring Boot starts
    @EventListener(ApplicationReadyEvent.class)
    public void seedAdmins() {
        System.out.println("🏠 Basement Dweller Admin Seeder Starting...");

        createAdminIfNotExists("admin1@seax.com", "Admin", "One", "SeaXAdmin2025!");
        createAdminIfNotExists("admin2@seax.com", "Admin", "Two", "SeaXAdmin2025!");

        System.out.println("✅ Admin accounts ready for production!");
    }

    private void createAdminIfNotExists(String email, String firstName, String lastName, String password) {
        User existingUser = userRepository.findByEmail(email);

        if (existingUser == null) {
            User admin = new User();
            admin.setFirstName(firstName);
            admin.setLastName(lastName);
            admin.setEmail(email);
            admin.setPassword(passwordService.hashPassword(password));
            admin.setRole("ADMIN"); //ADMIN FROM THE START!

            userRepository.save(admin);
            System.out.println("🔥 Created admin: " + email);
        } else {
            //Ensure existing user is admin
            if (!"ADMIN".equals(existingUser.getRole())) {
                existingUser.setRole("ADMIN");
                userRepository.save(existingUser);
                System.out.println("🔄 Updated " + email + " to ADMIN role");
            }
            System.out.println("✅ Admin exists: " + email);
        }
    }
}