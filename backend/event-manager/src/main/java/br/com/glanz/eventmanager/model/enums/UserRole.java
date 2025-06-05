package br.com.glanz.eventmanager.model.enums;

public enum UserRole {
    ADMIN("ROLE_ADMIN"), // Garante que a string associada é ROLE_ADMIN
    CLIENTE("ROLE_CLIENTE"); // Garante que a string associada é ROLE_CLIENTE

    private String role;

    UserRole(String role){
        this.role = role;
    }

    public String getRole(){
        // Este método getRole() agora retorna "ROLE_ADMIN" ou "ROLE_CLIENTE"
        return role;
    }
}