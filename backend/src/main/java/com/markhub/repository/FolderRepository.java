package com.markhub.repository;

import com.markhub.entity.Folder;
import com.markhub.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FolderRepository extends JpaRepository<Folder, Long> {

    List<Folder> findByProjectOrderByNameAsc(Project project);

    List<Folder> findByProjectIdOrderByNameAsc(Long projectId);
}
