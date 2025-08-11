package com.seax.back.repository;

import com.seax.back.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    //1. Find user by email (for login)
    User  findByEmail(String email);

}
