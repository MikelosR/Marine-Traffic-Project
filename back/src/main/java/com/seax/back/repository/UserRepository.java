package com.seax.back.repository;

import com.seax.back.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    //1. Find user by email (for login)
    //Spring generates: SELECT * FROM users WHERE email = ?
    User  findByEmail(String email);
    //2. For getting user by ID (when i will add tokens later)
    //findById() is already provided by JpaRepository!
    //All other methods (save, delete, findById, etc.) come FREE from JpaRepository
}

/*When you write extends JpaRepository<User, Long>, Spring automatically gives me 20+ methods:

java// Spring automatically provides these methods:
User save(User user);                    // ← This is where .save() comes from!
Optional<User> findById(Long id);        // ← This too
List<User> findAll();                    // ← And this
void delete(User user);                  // ← And this
void deleteById(Long id);               // ← And this
long count();                           // ← And this
boolean existsById(Long id);            // ← And this
// ... and 15+ more methods!*/
