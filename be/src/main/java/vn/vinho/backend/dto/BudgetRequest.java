package vn.vinho.backend.dto;

import java.util.Map;

public class BudgetRequest {
    private String userId;
    private Map<String, Number> budgets;

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Map<String, Number> getBudgets() { return budgets; }
    public void setBudgets(Map<String, Number> budgets) { this.budgets = budgets; }
}